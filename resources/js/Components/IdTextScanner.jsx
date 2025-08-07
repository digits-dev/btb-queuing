import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import classNames from "classnames";

const sampleData = [
    {
        name: "John Doe",
        contact: "09171234567",
        birthdate: "1995-04-21",
    },
    {
        name: "Jane Smith",
        contact: "09981234567",
        birthdate: "1992-11-10",
    },
    {
        name: "Florentino Floro",
        contact: "09056781234",
        birthdate: "1953-11-05",
    },
];

// Enhanced normalize function with better character handling
const normalize = (str) =>
    str
        .toLowerCase()
        .replace(/[^\w\s]/g, "") // Remove punctuation but keep spaces
        .replace(/\s+/g, " ") // Normalize spaces
        .trim();

// More flexible ID type detection
const detectIDType = (text) => {
    const upper = text.toUpperCase();

    // PWD detection with multiple patterns
    const pwdPatterns = [
        "PWD",
        "PERSONS WITH DISABILITY",
        "PERSONS WITH DISABILITIES",
        "PERSON WITH DISABILITY",
        "DISABILITY",
        "DISABLED",
    ];

    // Senior detection with multiple patterns
    const seniorPatterns = [
        "SENIOR CITIZEN",
        "SENIOR",
        "ELDERLY",
        "SENIOR CITIZENS",
    ];

    for (const pattern of pwdPatterns) {
        if (upper.includes(pattern)) {
            return "pwd";
        }
    }

    for (const pattern of seniorPatterns) {
        if (upper.includes(pattern)) {
            return "senior citizen";
        }
    }

    return "unknown";
};

// Enhanced name matching with fuzzy logic
const matchName = (extractedText, fullName) => {
    const normalizedText = normalize(extractedText);
    const parts = fullName.trim().split(/\s+/);

    if (parts.length < 2) return false;

    const firstName = normalize(parts[0]);
    const lastName = normalize(parts[parts.length - 1]);

    // Check for exact matches first
    const hasFirstName = normalizedText.includes(firstName);
    const hasLastName = normalizedText.includes(lastName);

    if (hasFirstName && hasLastName) {
        return true;
    }

    // Fuzzy matching for OCR errors
    const words = normalizedText.split(" ");

    // Check if any word is similar to first/last name (allowing 1-2 character differences)
    const isSimilar = (word1, word2) => {
        if (Math.abs(word1.length - word2.length) > 2) return false;

        let differences = 0;
        const maxLen = Math.max(word1.length, word2.length);

        for (let i = 0; i < maxLen; i++) {
            if (word1[i] !== word2[i]) {
                differences++;
                if (differences > 2) return false;
            }
        }
        return differences <= 2;
    };

    const firstNameMatch = words.some(
        (word) =>
            word.length >= 3 &&
            (word.includes(firstName) || isSimilar(word, firstName))
    );

    const lastNameMatch = words.some(
        (word) =>
            word.length >= 3 &&
            (word.includes(lastName) || isSimilar(word, lastName))
    );

    return firstNameMatch && lastNameMatch;
};

const IdTextScanner = ({
    selectedQualification,
    onTextExtracted,
    onIdTypeDetected,
}) => {
    const webcamRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [scannedText, setScannedText] = useState("");
    const [matchStatus, setMatchStatus] = useState("idle");
    const [matchedPerson, setMatchedPerson] = useState(null);
    const [detectedType, setDetectedType] = useState("");
    const [scanProgress, setScanProgress] = useState(0);
    const [isWebcamReady, setIsWebcamReady] = useState(false);
    const [scanAttempts, setScanAttempts] = useState(0);

    // Optimized video constraints for better OCR
    const videoConstraints = {
        facingMode: "environment",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        aspectRatio: 16 / 9,
        focusMode: "continuous",
        exposureMode: "continuous",
        whiteBalanceMode: "continuous",
    };

    const captureAndScan = async () => {
        if (
            !webcamRef.current ||
            !webcamRef.current.video ||
            webcamRef.current.video.readyState !== 4
        ) {
            return;
        }

        setScanning(true);
        setMatchStatus("scanning");
        setScanProgress(0);
        setScanAttempts((prev) => prev + 1);

        const imageSrc = webcamRef.current.getScreenshot({
            width: 1920,
            height: 1080,
            quality: 0.95,
        });

        try {
            // Enhanced Tesseract configuration for better accuracy
            const result = await Tesseract.recognize(imageSrc, "eng", {
                logger: (m) => {
                    if (m.status === "recognizing text") {
                        setScanProgress(Math.round(m.progress * 100));
                    }
                },
                tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
                tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
                tessedit_char_whitelist:
                    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,:-/",
                preserve_interword_spaces: "1",
            });

            const extractedText = result.data.text;
            setScannedText(extractedText);
            onTextExtracted?.(extractedText);

            console.log(`Scan attempt ${scanAttempts}:`, extractedText);

            const detectedIdType = detectIDType(extractedText);
            setDetectedType(detectedIdType);
            onIdTypeDetected?.(detectedIdType);

            // Enhanced matching with confidence scoring
            let bestMatch = null;
            let bestScore = 0;

            for (const person of sampleData) {
                const isNameMatch = matchName(extractedText, person.name);
                const isTypeMatch = detectedIdType === selectedQualification;

                if (isNameMatch && isTypeMatch) {
                    // Calculate confidence score based on text quality
                    const textLength = extractedText.length;
                    const wordCount = extractedText.split(/\s+/).length;
                    const score = textLength > 50 && wordCount > 5 ? 1 : 0.8;

                    if (score > bestScore) {
                        bestMatch = person;
                        bestScore = score;
                    }
                }
            }

            if (bestMatch && bestScore > 0.7) {
                setMatchStatus("success");
                setMatchedPerson(bestMatch);
                setScanAttempts(0); // Reset attempts on success
                console.log("✅ ID Match:", bestMatch);
                console.log("✅ Name matched:", bestMatch.name);
                console.log("✅ Type matched:", detectedIdType);
                console.log("✅ Confidence score:", bestScore);
            } else {
                setMatchStatus("error");
                setMatchedPerson(null);
                console.warn(`❌ ID did not match (attempt ${scanAttempts})`);
                console.warn("❌ Detected type:", detectedIdType);
                console.warn("❌ Expected type:", selectedQualification);

                // Debug: Check which names were found
                const nameMatches = sampleData.filter((item) =>
                    matchName(extractedText, item.name)
                );
                console.log(
                    "Names found in text:",
                    nameMatches.map((p) => p.name)
                );
            }
        } catch (err) {
            console.error("OCR failed:", err);
            setMatchStatus("error");
            setMatchedPerson(null);
        } finally {
            setScanning(false);
            setScanProgress(0);
        }
    };

    useEffect(() => {
        if (
            matchStatus !== "success" &&
            isWebcamReady &&
            selectedQualification
        ) {
            // Adaptive scanning interval - faster initially, slower after multiple attempts
            const interval = scanAttempts > 5 ? 2000 : 1500;

            const scanInterval = setInterval(() => {
                if (!scanning) captureAndScan();
            }, interval);

            return () => clearInterval(scanInterval);
        }
    }, [
        scanning,
        matchStatus,
        isWebcamReady,
        selectedQualification,
        scanAttempts,
    ]);

    const getStatusStyles = () => {
        switch (matchStatus) {
            case "scanning":
                return "border-blue-500 shadow-lg shadow-blue-200 bg-blue-50";
            case "success":
                return "border-green-500 shadow-lg shadow-green-200 bg-green-50";
            case "error":
                return "border-red-500 shadow-lg shadow-red-200 bg-red-50";
            default:
                return "border-gray-300 shadow-md bg-white";
        }
    };

    const getStatusIcon = () => {
        switch (matchStatus) {
            case "scanning":
                return "🔍";
            case "success":
                return "✅";
            case "error":
                return "❌";
            default:
                return "📷";
        }
    };

    const getQualificationDisplay = () => {
        if (selectedQualification === "pwd") return "PWD";
        if (selectedQualification === "senior citizen") return "Senior Citizen";
        return selectedQualification;
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 rounded-xl">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        ID Verification Scanner
                    </h2>
                    <p className="text-gray-600">
                        Scanning for:{" "}
                        <span className="font-semibold text-blue-600">
                            {getQualificationDisplay()}
                        </span>{" "}
                        ID
                        {scanAttempts > 0 && (
                            <span className="text-sm text-gray-500 ml-2">
                                (Attempt: {scanAttempts})
                            </span>
                        )}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Camera Section */}
                    <div
                        className={`rounded-xl transition-all duration-500 p-6 ${getStatusStyles()}`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                {getStatusIcon()} Camera Feed
                            </h3>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {getQualificationDisplay()}
                            </span>
                        </div>

                        <div className="relative">
                            <div
                                className={classNames(
                                    "rounded-lg overflow-hidden transition-all duration-300 border-4",
                                    {
                                        "border-gray-300":
                                            matchStatus === "idle",
                                        "border-blue-400 animate-pulse":
                                            matchStatus === "scanning",
                                        "border-green-500":
                                            matchStatus === "success",
                                        "border-red-500":
                                            matchStatus === "error",
                                    }
                                )}
                            >
                                <Webcam
                                    ref={webcamRef}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
                                    screenshotQuality={0.95}
                                    width="100%"
                                    height="auto"
                                    videoConstraints={videoConstraints}
                                    onUserMedia={() => setIsWebcamReady(true)}
                                    className="w-full h-auto"
                                />

                                {/* Scanning Overlay */}
                                {matchStatus === "scanning" && (
                                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center z-20">
                                        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg">
                                            <div className="animate-spin text-4xl mb-3">
                                                🔍
                                            </div>
                                            <p className="text-lg font-semibold text-blue-700 mb-2">
                                                Scanning{" "}
                                                {getQualificationDisplay()}{" "}
                                                ID...
                                            </p>
                                            <div className="w-48 bg-gray-200 rounded-full h-3 mb-2">
                                                <div
                                                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${scanProgress}%`,
                                                    }}
                                                />
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {scanProgress}% Complete
                                            </p>
                                            {scanAttempts > 3 && (
                                                <p className="text-xs text-orange-600 mt-1">
                                                    Hold steady for better
                                                    results
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Success Overlay */}
                                {matchStatus === "success" && (
                                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-20">
                                        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg">
                                            <div className="text-4xl mb-3">
                                                ✅
                                            </div>
                                            <p className="text-lg font-semibold text-green-700">
                                                {getQualificationDisplay()} ID
                                                Verified!
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Error Overlay */}
                                {matchStatus === "error" && (
                                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-20">
                                        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg">
                                            <div className="text-4xl mb-3">
                                                ❌
                                            </div>
                                            <p className="text-lg font-semibold text-red-700">
                                                Verification Failed
                                            </p>
                                            <p className="text-sm text-red-600 mt-1">
                                                {detectedType === "unknown"
                                                    ? "ID type not recognized"
                                                    : `Expected ${getQualificationDisplay()}, found ${
                                                          detectedType ===
                                                          "senior citizen"
                                                              ? "Senior Citizen"
                                                              : "PWD"
                                                      }`}
                                            </p>
                                            {scanAttempts > 5 && (
                                                <p className="text-xs text-orange-600 mt-1">
                                                    Try adjusting lighting or
                                                    angle
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Manual Scan Button */}
                            <button
                                onClick={captureAndScan}
                                disabled={scanning || !isWebcamReady}
                                className={classNames(
                                    "w-full mt-4 py-3 px-6 rounded-lg font-semibold transition-all duration-200",
                                    {
                                        "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl":
                                            !scanning && isWebcamReady,
                                        "bg-gray-300 text-gray-500 cursor-not-allowed":
                                            scanning || !isWebcamReady,
                                    }
                                )}
                            >
                                {scanning ? (
                                    <>🔍 Scanning... {scanProgress}%</>
                                ) : !isWebcamReady ? (
                                    "📷 Initializing Camera..."
                                ) : (
                                    `📸 Scan ${getQualificationDisplay()} ID`
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-4">
                        {/* Status Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                📊 Scan Status
                            </h4>

                            {matchStatus === "idle" && (
                                <div className="p-3 bg-gray-100 rounded-lg border-l-4 border-gray-400">
                                    <p className="text-gray-700 text-sm">
                                        Ready to scan. Position your{" "}
                                        <strong>
                                            {getQualificationDisplay()}
                                        </strong>{" "}
                                        ID within the guidelines.
                                    </p>
                                </div>
                            )}

                            {matchStatus === "scanning" && (
                                <div className="p-3 bg-blue-100 rounded-lg border-l-4 border-blue-500">
                                    <p className="text-blue-700 font-medium text-sm text-start">
                                        🔍 Scanning for name and{" "}
                                        <strong>
                                            {getQualificationDisplay()}
                                        </strong>{" "}
                                        keywords...
                                    </p>
                                    {scanAttempts > 3 && (
                                        <p className="text-blue-600 text-xs mt-1 text-start">
                                            💡 Tip: Ensure good lighting and
                                            hold the ID steady
                                        </p>
                                    )}
                                </div>
                            )}

                            {matchStatus === "success" && (
                                <div className="p-3 bg-green-100 rounded-lg border-l-4 border-green-500">
                                    <p className="text-green-700 font-medium text-sm">
                                        ✅{" "}
                                        <strong>
                                            {getQualificationDisplay()}
                                        </strong>{" "}
                                        ID verified successfully! Name found in
                                        database.
                                    </p>
                                </div>
                            )}

                            {matchStatus === "error" && (
                                <div className="p-3 bg-red-100 rounded-lg border-l-4 border-red-500">
                                    <p className="text-red-700 font-medium text-sm text-start">
                                        ❌ Verification failed.
                                        {detectedType === "unknown"
                                            ? " ID type not recognized."
                                            : detectedType !==
                                              selectedQualification
                                            ? ` Wrong ID type detected (${
                                                  detectedType ===
                                                  "senior citizen"
                                                      ? "Senior Citizen"
                                                      : "PWD"
                                              }).`
                                            : " Name not found in database."}
                                    </p>
                                    {scanAttempts > 5 && (
                                        <p className="text-orange-600 text-xs mt-1 text-start">
                                            💡 Try improving lighting or
                                            repositioning the ID
                                        </p>
                                    )}
                                </div>
                            )}

                            {detectedType && detectedType !== "unknown" && (
                                <div className="mt-3">
                                    <span
                                        className={classNames(
                                            "inline-block px-3 py-1 rounded-full text-xs font-medium",
                                            {
                                                "bg-green-100 text-green-800":
                                                    detectedType ===
                                                    selectedQualification,
                                                "bg-red-100 text-red-800":
                                                    detectedType !==
                                                    selectedQualification,
                                            }
                                        )}
                                    >
                                        Detected:{" "}
                                        {detectedType === "senior citizen"
                                            ? "Senior Citizen"
                                            : "PWD"}{" "}
                                        ID
                                        {detectedType === selectedQualification
                                            ? " ✅"
                                            : " ❌"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Matched Person Details */}
                        {matchedPerson && (
                            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                                <h4 className="text-lg font-semibold mb-3 text-green-700 flex items-center gap-2">
                                    👤 Verified Person
                                </h4>
                                <div className="space-y-2 text-start">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">👤</span>
                                        <div>
                                            <p className="font-semibold">
                                                {matchedPerson.name}
                                            </p>
                                            <p className="text-gray-600 text-xs">
                                                ✅ Name Match Confirmed
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">📞</span>
                                        <div>
                                            <p className="font-medium text-sm">
                                                {matchedPerson.contact}
                                            </p>
                                            <p className="text-gray-600 text-xs">
                                                Contact Number
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">🆔</span>
                                        <div>
                                            <p className="font-medium text-sm">
                                                {getQualificationDisplay()} ID
                                            </p>
                                            <p className="text-gray-600 text-xs">
                                                ✅ ID Type Match Confirmed
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tips for Better Scanning */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                💡 Scanning Tips
                            </h4>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">
                                        ✓
                                    </span>
                                    <span>Ensure good lighting on the ID</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">
                                        ✓
                                    </span>
                                    <span>
                                        Hold the ID steady within the guidelines
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">
                                        ✓
                                    </span>
                                    <span>Avoid glare and shadows</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">
                                        ✓
                                    </span>
                                    <span>
                                        Keep the ID flat and fully visible
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Debug Section - Show only when needed */}
                {scannedText && scanAttempts > 3 && (
                    <div className="mt-6 bg-white rounded-xl shadow-lg p-4 hidden">
                        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            🔍 Extracted Text (Debug)
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                                {scannedText}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IdTextScanner;

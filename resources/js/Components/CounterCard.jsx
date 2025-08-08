import CardDisplay from "./CardDisplay";
import { Player } from "@lottiefiles/react-lottie-player";

export default function CounterCard({
    counterName,
    status,
    servingNumber,
    className = "",
}) {
    return (
        <CardDisplay className={`mt-6 ${className}`}>
            <div
                className={`${status !== "offline" ? "animate-pulse" : ""} ${
                    status === "serving"
                        ? "bg-green-300 shadow-xl rounded-md pt-3 animate-pump"
                        : ""
                }`}
            >
                <small className="text-gray-800 text-lg font-black tracking-tight">
                    {counterName}
                </small>

                {status === "waiting" && (
                    <>
                        <h1 className="text-1xl text-gray-500 font-extrabold mb-4">
                            NOW SERVING
                        </h1>
                        <h1 className="text-2xl font-extrabold text-gray-400">
                            Waiting for next <br></br> customer...
                        </h1>
                        <div className="flex justify-center mt-4">
                            <Player
                                autoplay
                                loop
                                src="/img/waiting.json"
                                style={{ height: "68px", width: "300px" }}
                            />
                        </div>
                    </>
                )}

                {status === "serving" && (
                    <>
                        <h1 className="text-1xl text-gray-500 font-extrabold mb-4">
                            NOW SERVING
                        </h1>
                        <h1 className="text-5xl font-black tracking-tight text-gray-900 py-2  ">
                            {servingNumber}
                        </h1>
                        <div className="flex justify-center mt-4 bg-gray-100 rounded-md py-4 px-1">
                            <h1 className="text-md text-gray-900 mx-3">
                                Please proceed to the counter
                            </h1>
                        </div>
                    </>
                )}

                {status === "offline" && (
                    <>
                        <h1 className="text-2xl text-red-500 font-extrabold mb-4">
                            OFFLINE
                        </h1>
                        <h1 className="text-4xl font-extrabold text-gray-400">
                            This counter is currently offline
                        </h1>
                    </>
                )}
            </div>
        </CardDisplay>
    );
}

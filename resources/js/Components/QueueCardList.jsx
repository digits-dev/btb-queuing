export default function QueueCardList({ number, service, lane, isActive, onNext, onRemove }) {
    return (
        <div
            className={`flex justify-between items-center rounded-md p-4 mb-2 border 
                ${isActive ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}
            `}
        >
            <div className="text-start">
                <h2 className="font-bold text-lg">{number}</h2>
                <p className="text-sm text-gray-500 capitalize">
                    {lane} &bull; {service}
                </p>
            </div>

            <div className="flex items-center gap-2">
                {isActive && (
                    <button
                        onClick={onNext}
                        className="bg-gray-100 text-sm px-3 py-1 rounded-full font-semibold text-gray-700 hover:bg-gray-200"
                    >
                        Next
                    </button>
                )}
                <button
                    onClick={onRemove}
                    className="text-xl text-black hover:text-red-500"
                >
                    &times;
                </button>
            </div>
        </div>
    );
}

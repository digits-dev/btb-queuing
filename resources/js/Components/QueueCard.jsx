export default function QueueCard({ number, name, service, isActive }) {
    return (
        <div
            className={`rounded-lg p-4 w-36 text-center shadow-xl border transition ${
                isActive
                    ? "bg-orange-200 border-orange-300 text-orange-600 font-semibold"
                    : "bg-gray-200 border-gray-300 text-gray-700 font-semibold"
            }`}
        >
            <div className={`text-2xl font-extrabold ${isActive ? "text-orange-500" : ""}`}>
                {number}
            </div>
            <div className="mt-1 font-medium">{name}</div>
            <div className="text-sm text-gray-500 uppercase">{service}</div>
        </div>
    );
}

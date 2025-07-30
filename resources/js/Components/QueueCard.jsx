export default function QueueCard({ number, name, service, isActive }) {
    return (
        <div
            className={`rounded-lg p-4 w-40 text-center shadow-xl border transition ${
                isActive
                    ? "bg-orange-100 border-orange-200 text-orange-600 font-semibold"
                    : "bg-gray-100 border-gray-200 text-gray-700 font-semibold"
            }`}
        >
            <div className={`text-3xl font-extrabold ${isActive ? "text-orange-500" : ""}`}>
                {number}
            </div>
            <div className="mt-2 font-medium">{name}</div>
            <div className="text-sm text-gray-500 uppercase">{service}</div>
        </div>
    );
}

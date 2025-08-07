import PrimaryButton from "./PrimaryButton";

export default function ServiceOptionCard({
    id,
    title,
    price,
    description,
    asignments,
    selected,
    onChange,
    image,
    children,
}) {
    return (
        <label
            className={`cursor-pointer border-[1px] rounded-xl bg-white hover:shadow-md transition-all w-54 overflow-hidden ${
                selected ? "ring-1 ring-gray-400 shadow-lg" : ""
            }`}
        >
            <input
                type="radio"
                name="service"
                value={id}
                checked={selected}
                onChange={() => onChange(id)}
                className="hidden"
            />

            <div className="h-36 bg-gray-100 flex items-center justify-center">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="w-20 object-cover"
                    />
                ) : (
                    <div className="text-gray-400 text-sm">
                        <i className="fa-regular fa-image text-2xl"></i>
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex justify-center items-center mb-1">
                    <h3 className="font-semibold text-gray-800 text-center">
                        {title}
                    </h3>
                    <span className="text-green-600 font-bold">{price}</span>
                </div>

                <p className="text-sm text-gray-500">{description}</p>

                {asignments && (
                    <>
                        <div className="mt-2 flex items-center justify-center text-sm text-gray-500 mb-2">
                            {asignments == "Available" ? (
                                <div className="font-semibold text-green-500">
                                    <i className="bi bi-check-circle mr-2"></i>
                                    {asignments}
                                </div>
                            ) : (
                                <div className="font-semibold text-red-500">
                                    <i className="bi bi-slash-circle mr-2"></i>
                                    Taken
                                    <small className="ms-2">
                                        ({asignments})
                                    </small>
                                </div>
                            )}
                        </div>
                        <div>{children}</div>
                    </>
                )}
            </div>
        </label>
    );
}

export default function LaneSelectionCard({ type = 'regular', onSelect }) {
  const data = {
      regular: {
          icon: (
              <div className="bg-green-100 p-4 px-5 rounded-full">
                  <i className="fa-solid fa-user text-green-600 text-3xl"></i>
              </div>
          ),
          title: "Regular Lane",
          description: (
              <>
                This lane is reserved for all <br /> regular customers.
              </>
            ),
          features: [
              {
                  icon: <i className="fa-regular fa-clock text-gray-500"></i>,
                  text: "Standard wait times",
              },
              {
                  icon: <i className="fa-regular fa-star text-gray-500"></i>,
                  text: "Multiple service options",
              },
          ],
          buttonText: "Regular Lane",
          colorClasses: "bg-green-600 hover:bg-green-700",
      },
      priority: {
          icon: (
              <div className="bg-orange-100 p-4 px-5 rounded-full">
                  <i className="fa-solid fa-bolt text-orange-500 text-3xl"></i>
              </div>
          ),
          title: "Priority Lane",
          description: "This lane is for Senior Citizens, Persons with Disabilities, and Pregnant Women.",
          features: [
              {
                  icon: <i className="fa-solid fa-bolt text-gray-500"></i>,
                  text: "Less wait time",
              },
              {
                  icon: <i className="fa-regular fa-star text-gray-500"></i>,
                  text: "Premium full service",
              },
          ],
          buttonText: "Priority Lane",
          colorClasses: "bg-orange-600 hover:bg-orange-700",
          badge: "Priority",
      },
  };

  const lane = data[type];

  return (
    <div className="relative bg-white rounded-lg p-6 w-full max-w-md border-[1px] hover:shadow-md">
      {lane.badge && (
        <span className="absolute top-3 right-3 bg-orange-600 text-white text-xs px-3 font-bold py-0.5 rounded-full">
          {lane.badge}
        </span>
      )}
      <div className="flex flex-col items-center text-center gap-2">
        {lane.icon}
        <h3 className={`text-xl font-bold ${lane.colorClasses.split(' ')[2]}`}>{lane.title}</h3>
        <p className="text-md text-gray-600">{lane.description}</p>
        <ul className="mt-4 space-y-1 text-md text-gray-700 hidden">
          {lane.features.map((feat, index) => (
            <li key={index} className="flex items-center gap-2 justify-center">
              {feat.icon}
              {feat.text}
            </li>
          ))}
        </ul>
        <button
          className={`mt-6 px-4 py-2 rounded-md text-white font-medium ${lane.colorClasses}`}
          onClick={onSelect}
        >
          {lane.buttonText}
          <i className="fa fa-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  );
}

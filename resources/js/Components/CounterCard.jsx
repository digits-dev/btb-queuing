import CardDisplay from './CardDisplay';

export default function CounterCard({ counterName, status, servingNumber, className="" }) {
  return (
    <CardDisplay className={`mt-6 ${className}`}>
      <div className={`${status !== 'offline' ? 'animate-pulse' : ''} ${status === 'serving' ? 'bg-blue-200 shadow-xl rounded-md pt-3' : ''}`}>
        <small className="text-gray-800 text-lg font-black tracking-tight">
          {counterName}
        </small>

        {status === 'waiting' && (
          <>
            <h1 className="text-2xl text-gray-500 font-extrabold mb-4">
              NOW SERVING
            </h1>
            <h1 className="text-4xl font-extrabold text-gray-400">
              Waiting for next customer...
            </h1>
            <div className="flex justify-center mt-4">
              <img
                src="https://cdn-icons-gif.flaticon.com/10282/10282564.gif"
                className="w-[100px]"
                alt="Waiting Animation"
              />
            </div>
          </>
        )}

        {status === 'serving' && (
          <>
            <h1 className="text-2xl text-gray-500 font-extrabold mb-4">
              NOW SERVING
            </h1>
            <h1 className="text-7xl font-black tracking-tight text-gray-900 py-2">
              {servingNumber}
            </h1>
            <div className="flex justify-center mt-4 bg-gray-100 rounded-md py-4 px-1">
              <img
                src="https://cdn-icons-png.flaticon.com/128/55/55240.png"
                className="w-5"
                alt=""
              />
              <h1 className="text-md font-extrabold text-gray-900 mx-3">
                Please proceed to your counter.
              </h1>
              <img
                src="https://cdn-icons-png.flaticon.com/128/7512/7512321.png"
                className="w-5"
                alt=""
              />
            </div>
          </>
        )}

        {status === 'offline' && (
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

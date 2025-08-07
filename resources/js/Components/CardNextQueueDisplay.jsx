export default function CardNextQueueDisplay({ children, className = '' }) {
  return (
      <div className="flex flex-col items-center justify-start px-4 my-2 mt-4">
          <div
              className={`bg-white shadow rounded-lg w-full px-5 py-5 text-center ${className}`}
          >
              {children}
          </div>
      </div>
  );
}

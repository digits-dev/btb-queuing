export default function CardNextQueueDisplay({ children, className = '' }) {
  return (
      <div className="flex flex-col items-center justify-start px-4 my-8">
          <div
              className={`bg-white shadow rounded-lg w-full px-8 py-10 text-center ${className}`}
          >
              {children}
          </div>
      </div>
  );
}

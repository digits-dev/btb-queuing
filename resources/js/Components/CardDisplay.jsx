export default function CardDisplay({children, className = '' }) {
  return (
      <div className="flex flex-col items-center justify-start px-4">
          <div
              className={`bg-white shadow rounded-lg w-full px-8 py-10 text-center border-[1px] border-gray-300 ${className}`}
          >
              {children}
          </div>
      </div>
  );
}

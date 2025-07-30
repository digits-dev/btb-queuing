export default function ApplicationHeader({title, subtitle}) {
  return (
      <div className="flex flex-col items-center justify-center gap-2">
          {/* logo image  */}
          <div className="mt-8">
              <img src="/img/btblogo.png" className="w-[250px]" alt="" />
          </div>

          {/* Header */}
          <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          </div>
      </div>
  );
}
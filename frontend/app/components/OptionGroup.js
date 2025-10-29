export default function OptionGroup({ title, children }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}

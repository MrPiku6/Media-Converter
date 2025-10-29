export default function ProgressBar({ progress, statusText }) {
  return (
    <div className="w-full bg-gray-700 rounded-full h-6 my-4">
      <div
        className="bg-green-600 h-6 rounded-full text-center text-white text-sm leading-6 transition-all duration-500"
        style={{ width: `${progress}%` }}
      >
        {statusText} ({Math.round(progress)}%)
      </div>
    </div>
  );
}

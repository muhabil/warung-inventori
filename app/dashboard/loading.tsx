export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
        <p className="mt-6 text-lg font-medium text-gray-700">Memuat...</p>
        <p className="text-sm text-gray-500 mt-1">Mohon tunggu sebentar</p>
      </div>
    </div>
  );
}
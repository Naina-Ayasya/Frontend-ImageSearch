const AnalyzingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-6"></div>
      <h2 className="text-xl font-semibold text-gray-700">Analyzing image...</h2>
      <p className="text-gray-500 mt-2">This may take a few seconds</p>
    </div>
  );
};

export default AnalyzingScreen;

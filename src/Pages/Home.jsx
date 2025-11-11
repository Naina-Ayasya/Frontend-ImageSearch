import TileUploader from "../Components/ImageSearch/UploadTiles";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mt-16">
        <TileUploader />
      </div>
    </div>
  );
};

export default Home;
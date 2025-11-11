
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnalyzingScreen from "../Components/ImageSearch/AnalyzingScreen";

const Analyzing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/results");
    }, 10000); 

    return () => clearTimeout(timeout);
  }, [navigate]);

  return <AnalyzingScreen />;
};

export default Analyzing;

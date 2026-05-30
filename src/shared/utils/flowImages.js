import analyzingDataPageImg from "../../assets/images/analyzingDataPageImg.webp";
import completePageImg from "../../assets/images/completePageImg.webp";
import { preloadImage, preloadImages } from "./preloadImage";

export { analyzingDataPageImg, completePageImg };

export function preloadAnalyzingFlowImages() {
    return preloadImages([analyzingDataPageImg, completePageImg]);
}

/** Fire-and-forget preload, then navigate — keeps transitions smooth on hero-image pages. */
export function goToAnalyzingData(navigate, state) {
    preloadImage(analyzingDataPageImg);
    navigate("/analyzing-data", { state });
}

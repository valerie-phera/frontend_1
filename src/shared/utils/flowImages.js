import analyzingDataPageImg from "../../assets/images/analyzingDataPageImg.webp";
import completePageImg from "../../assets/images/completePageImg.webp";
import { preloadImages } from "./preloadImage";

export { analyzingDataPageImg, completePageImg };

export function preloadAnalyzingFlowImages() {
    preloadImages([analyzingDataPageImg, completePageImg]);
}

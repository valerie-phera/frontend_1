import { useEffect } from "react";
import { preloadImage } from "../../shared/utils/preloadImage";
import styles from "./ImageWrapper.module.css";

const ImageWrapper = ({ src, alt, width, height, priority = false }) => {
    const hasDimensions = Number(width) > 0 && Number(height) > 0;

    useEffect(() => {
        if (priority && src) preloadImage(src);
    }, [priority, src]);

    return (
        <div
            className={styles.img}
            style={
                hasDimensions
                    ? {
                          aspectRatio: `${width} / ${height}`,
                          maxWidth: width,
                      }
                    : undefined
            }
        >
            <img
                src={src}
                alt={alt}
                width={hasDimensions ? width : undefined}
                height={hasDimensions ? height : undefined}
                decoding="async"
                fetchPriority={priority ? "high" : "auto"}
                className={styles.imgEl}
            />
        </div>
    );
};

export default ImageWrapper;

// using:
// <ImageWrapper src={step5} alt="step 5" width={345} height={218} />
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { isImageCached, preloadImage } from "../../shared/utils/preloadImage";
import styles from "./ImageWrapper.module.css";

const ImageWrapper = ({ src, alt, width, height, priority = false }) => {
    const hasDimensions = Number(width) > 0 && Number(height) > 0;
    const imgRef = useRef(null);
    const [loaded, setLoaded] = useState(() => isImageCached(src));

    useLayoutEffect(() => {
        const img = imgRef.current;
        if (img?.complete && img.naturalWidth > 0) {
            setLoaded(true);
        } else {
            setLoaded(isImageCached(src));
        }
    }, [src]);

    useEffect(() => {
        if (!src) return undefined;
        let cancelled = false;

        if (priority) {
            preloadImage(src).then(() => {
                if (!cancelled) setLoaded(true);
            });
        }

        return () => {
            cancelled = true;
        };
    }, [priority, src]);

    const markLoaded = () => setLoaded(true);

    return (
        <div
            className={`${styles.img} ${loaded ? styles.imgReady : styles.imgPending}`}
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
                ref={imgRef}
                src={src}
                alt={alt}
                width={hasDimensions ? width : undefined}
                height={hasDimensions ? height : undefined}
                loading={priority ? "eager" : "lazy"}
                decoding={priority ? "sync" : "async"}
                fetchPriority={priority ? "high" : "auto"}
                className={`${styles.imgEl} ${loaded ? styles.imgElVisible : ""}`}
                onLoad={markLoaded}
            />
        </div>
    );
};

export default ImageWrapper;

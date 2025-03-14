import Image from "next/image";

const GalleryItem = ({ src, alt }) => (
  <div className="overflow-hidden rounded-xl shadow-lg hover:scale-105 transition-transform">
    <Image src={src} alt={alt} width={300} height={300} className="object-cover w-full h-64" />
  </div>
);

export default GalleryItem;

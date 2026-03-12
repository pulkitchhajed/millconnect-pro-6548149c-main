import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  ogType?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

const SEO = ({ 
  title, 
  description, 
  ogType = "website", 
  ogImage = "https://mill-connect.com/og-image.jpg",
  canonicalUrl 
}: SEOProps) => {
  const fullTitle = title 
    ? `${title} | Mill-Connect` 
    : "Mill-Connect — Premium Fabric Sourcing & Supply Chain";

  const defaultDescription = "Mill-Connect connects garment manufacturers with top textile mills. Secure quality fabrics and reliable delivery.";

  useEffect(() => {
    // Update Title
    document.title = fullTitle;

    // Update Meta Description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description || defaultDescription);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", fullTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", description || defaultDescription);

    const ogTypeTag = document.querySelector('meta[property="og:type"]');
    if (ogTypeTag) ogTypeTag.setAttribute("content", ogType);

    const ogImgTag = document.querySelector('meta[property="og:image"]');
    if (ogImgTag) ogImgTag.setAttribute("content", ogImage);

    // Update Canonical Link if provided
    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalUrl);
    }
  }, [fullTitle, description, ogType, ogImage, canonicalUrl]);

  return null;
};

export default SEO;

/**
 * Open Graph image utilities for Swedish Wedding Site
 * Provides dynamic Open Graph images based on page type and content
 */

export interface OpenGraphImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export type PageType = 
  | 'homepage'
  | 'guide' 
  | 'checklist'
  | 'budget'
  | 'supplier'
  | 'venue'
  | 'inspiration'
  | 'tradition'
  | 'city'
  | 'service'
  | 'programmatic';

/**
 * Get Open Graph image for a specific page type and content
 */
export function getOpenGraphImage(
  pageType: PageType,
  options: {
    title?: string;
    category?: string;
    city?: string;
    supplierImage?: string;
    venueImage?: string;
  } = {}
): OpenGraphImage {
  const baseUrl = 'https://www.erabrollopsajt.se';
  
  // If we have a specific supplier or venue image, use that
  if (options.supplierImage) {
    return {
      src: `${baseUrl}${options.supplierImage}`,
      alt: `${options.title || 'Bröllopsleverantör'} - Bröllopssidan.se`,
      width: 1200,
      height: 630
    };
  }

  if (options.venueImage) {
    return {
      src: `${baseUrl}${options.venueImage}`,
      alt: `${options.title || 'Bröllopslokal'} - Bröllopssidan.se`,
      width: 1200,
      height: 630
    };
  }

  // Default images based on page type
  const imageMap: Record<PageType, string> = {
    homepage: '/assets/og/homepage-wedding.svg',
    guide: '/assets/og/guides-wedding.svg', 
    checklist: '/assets/og/checklist-wedding.svg',
    budget: '/assets/og/budget-wedding.svg',
    supplier: '/assets/og/supplier-wedding.svg',
    venue: '/assets/og/venue-wedding.svg',
    inspiration: '/assets/og/inspiration-wedding.svg',
    tradition: '/assets/og/tradition-wedding.svg',
    city: '/assets/og/city-wedding.svg',
    service: '/assets/og/service-wedding.svg',
    programmatic: '/assets/og/programmatic-wedding.svg'
  };

  const imagePath = imageMap[pageType] || imageMap.homepage;
  
  // Generate alt text based on page type and options
  let altText = 'Bröllopssidan.se - Planera ert drömbröllop';
  
  if (options.title) {
    altText = `${options.title} - Bröllopssidan.se`;
  } else {
    const typeTexts: Record<PageType, string> = {
      homepage: 'Planera ert drömbröllop med svenska experter',
      guide: 'Bröllopguider och expertråd',
      checklist: 'Bröllopschecklistor och planeringsverktyg', 
      budget: 'Bröllopbudget och kostnadskalkyler',
      supplier: 'Bröllopsleverantörer i Sverige',
      venue: 'Bröllopslokaler i Sverige',
      inspiration: 'Bröllopsinspiration och trender',
      tradition: 'Svenska bröllopstraditioner',
      city: `Bröllopsleverantörer${options.city ? ` i ${options.city}` : ''}`,
      service: `${options.category || 'Bröllopstjänster'}${options.city ? ` i ${options.city}` : ''}`,
      programmatic: 'Bröllopsleverantörer och tjänster'
    };
    
    altText = `${typeTexts[pageType]} - Bröllopssidan.se`;
  }

  return {
    src: `${baseUrl}${imagePath}`,
    alt: altText,
    width: 1200,
    height: 630
  };
}

/**
 * Generate dynamic Open Graph image URL using a service
 * This could be used for creating custom images with text overlays
 */
export function generateDynamicOGImage(
  title: string,
  subtitle?: string,
  template: 'default' | 'guide' | 'supplier' | 'venue' = 'default'
): OpenGraphImage {
  // This could integrate with a service like og-image.vercel.app
  // or a custom image generation endpoint
  const params = new URLSearchParams({
    title,
    subtitle: subtitle || '',
    template
  });
  
  return {
    src: `https://www.erabrollopsajt.se/api/og-image?${params}`,
    alt: `${title} - Bröllopssidan.se`,
    width: 1200,
    height: 630
  };
}

/**
 * Get fallback Open Graph image when no specific image is available
 */
export function getFallbackOGImage(): OpenGraphImage {
  return getOpenGraphImage('homepage');
}

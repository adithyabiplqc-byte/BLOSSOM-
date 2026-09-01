import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { extractGoogleDriveId, resolveIndexedDbImage, NormalizedImage } from '../utils/imageUtils';

interface SmartImageProps {
  image?: NormalizedImage | { url: string; previewUrl?: string; fallbackUrl?: string; fallbackUrl2?: string; embedUrl?: string; downloadUrl?: string; name?: string };
  src?: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  onClick?: (e: React.MouseEvent) => void;
  showDriveBadge?: boolean;
  priority?: boolean;
  aspectRatio?: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  image,
  src,
  alt = 'Inspection Photo',
  className = '',
  imgClassName = '',
  onClick,
  showDriveBadge = false,
  aspectRatio
}) => {
  const rawInitialSrc = image?.previewUrl || image?.url || src || '';
  const [currentSrc, setCurrentSrc] = useState<string>(rawInitialSrc);
  const [stage, setStage] = useState<'primary' | 'proxy' | 'fallback1' | 'fallback2' | 'iframe' | 'failed'>('primary');
  const [loading, setLoading] = useState<boolean>(true);
  const [driveId, setDriveId] = useState<string>('');

  useEffect(() => {
    let active = true;
    const initial = image?.previewUrl || image?.url || src || '';
    if (!initial) {
      setLoading(false);
      setStage('failed');
      return;
    }

    const dId = image?.driveId || extractGoogleDriveId(initial) || extractGoogleDriveId(image?.downloadUrl || '') || extractGoogleDriveId(image?.url || '');
    setDriveId(dId);

    if (initial.startsWith('indexeddb://')) {
      setLoading(true);
      resolveIndexedDbImage(initial).then(resolved => {
        if (active) {
          setCurrentSrc(resolved);
          setLoading(false);
          setStage('primary');
        }
      }).catch(() => {
        if (active) {
          setLoading(false);
          setStage('failed');
        }
      });
    } else if (dId && !initial.startsWith('data:image') && !initial.startsWith('/uploads/')) {
      // Primary thumbnail CDN
      setCurrentSrc(`https://drive.google.com/thumbnail?id=${dId}&sz=w1200`);
      setStage('primary');
      setLoading(true);
    } else {
      setCurrentSrc(initial);
      setStage('primary');
      setLoading(true);
    }

    return () => {
      active = false;
    };
  }, [image, src]);

  const handleError = () => {
    if (driveId) {
      if (stage === 'primary') {
        setStage('proxy');
        setCurrentSrc(`/api/drive-proxy?id=${driveId}`);
        return;
      }
      if (stage === 'proxy') {
        setStage('fallback1');
        setCurrentSrc(`https://lh3.googleusercontent.com/d/${driveId}=s1000`);
        return;
      }
      if (stage === 'fallback1') {
        setStage('fallback2');
        setCurrentSrc(`https://drive.google.com/uc?export=view&id=${driveId}`);
        return;
      }
    }
    
    if (image?.fallbackUrl && currentSrc !== image.fallbackUrl && stage !== 'fallback1' && stage !== 'fallback2') {
      setStage('fallback1');
      setCurrentSrc(image.fallbackUrl);
      return;
    }

    if (image?.fallbackUrl2 && currentSrc !== image.fallbackUrl2 && stage !== 'fallback2') {
      setStage('fallback2');
      setCurrentSrc(image.fallbackUrl2);
      return;
    }

    setStage('failed');
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  const openUrl = image?.downloadUrl || image?.url || src || (driveId ? `https://drive.google.com/file/d/${driveId}/view` : '');

  if (!rawInitialSrc || stage === 'failed') {
    return (
      <div
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-2 text-center text-slate-500 transition hover:bg-slate-200 dark:hover:bg-slate-750 ${onClick ? 'cursor-pointer hover:border-indigo-400' : ''} ${className}`}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <div className="p-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-1">
          <Icon name="image" size={16} />
        </div>
        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-full px-1">
          {image?.name || alt || 'Photo Evidence'}
        </span>
        {openUrl && (
          <a
            href={openUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1 inline-flex items-center gap-1 text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>View in Drive</span>
            <Icon name="external-link" size={10} />
          </a>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-slate-100 dark:bg-slate-900 rounded-xl group ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-[1px] z-10">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <img
        src={currentSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 ${imgClassName}`}
      />

      {/* Drive Badge */}
      {showDriveBadge && driveId && (
        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-bold text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Icon name="cloud" size={10} className="text-blue-400" />
          <span>Drive</span>
        </div>
      )}

      {/* Hover preview indicator */}
      {onClick && (
        <div className="absolute inset-0 bg-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white shadow-lg">
            <Icon name="zoom-in" size={14} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartImage;

import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";

export default function PhotoCropModal({
  open,
  imageSrc,
  onClose,
  onCropComplete,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [open, imageSrc]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b px-5 py-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Adjust Profile Photo
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Drag and zoom to choose exactly what will be cropped.
          </p>
        </div>

        <div className="relative h-[420px] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            objectFit="contain"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, croppedPixels) =>
              setCroppedAreaPixels(croppedPixels)
            }
            style={{
              containerStyle: {
                width: "100%",
                height: "100%",
                backgroundColor: "#111827",
              },
              cropAreaStyle: {
                border: "3px solid rgba(255,255,255,0.95)",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
              },
            }}
          />
        </div>

        <div className="border-t px-5 py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Zoom: {zoom.toFixed(2)}x
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="mt-2 w-full"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                if (!croppedAreaPixels) return;
                onCropComplete(croppedAreaPixels);
              }}
              className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
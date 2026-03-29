import fs from "node:fs"
export const cleanupTempFile = (localFilePath) => {
    if (!localFilePath) return;
    try {
        fs.unlinkSync(localFilePath)
    } catch (error) {
        if (err?.code !== "ENOENT") {
            console.error(`[cleanup] Failed to delete temp file:`, err);
        }
    }
}
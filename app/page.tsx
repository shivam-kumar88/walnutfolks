"use client"
import Image from "next/image";
import { useState } from "react";

interface SingleUploadRes {
  url: string; 
  key: string; 
  viewUrl:string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("/shivam.jpg");

  const be_BASE_url: string = "http://localhost:3000";

  const uploadSingleFile = async (selectedFile: File): Promise<void> => {
    setStatus("Generating single URL...");
    
    const res = await fetch(`${be_BASE_url}/api/generate-single-presigned-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: selectedFile.name, fileType: selectedFile.type }),
    });

    if (!res.ok) throw new Error("Failed to get presigned URL.");
    const { url, key, viewUrl } = (await res.json()) as SingleUploadRes;

    setStatus("Uploading file to S3...");

    const uploadRes = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": selectedFile.type },
      body: selectedFile,
    });

    if (!uploadRes.ok){
      throw new Error("Failed to upload to S3.")
    }
    else{
      const cleanUrl = viewUrl
      const permanentUrl = `https://file-uploder-23.s3.ap-southeast-2.amazonaws.com/${key}`;
      setUploadedImageUrl(cleanUrl);
    }


    
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      await uploadSingleFile(file);
      setStatus("Upload successful! 🎉");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed.";
      setStatus(`❌ ${errorMessage}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <div className="max-w-sm w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center mb-8">
        
        {/* 3. Image now uses the state variable */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <Image
            src={uploadedImageUrl} 
            alt="Uploaded Profile"
            fill
            priority
            className="rounded-full object-cover border-4 border-white shadow-md"
            sizes="128px"
            unoptimized // Useful if using external S3 URLs without configuring next.config.js
          />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Shivam Kumar
        </h1>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 w-full max-w-sm text-gray-900">
        <h2 className="text-lg font-semibold mb-4 text-center">Update Photo</h2>
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 mb-4"
        />
        <button 
          onClick={handleUpload} 
          className="w-full bg-sky-700 text-white font-bold py-2 rounded-full disabled:opacity-50 transition-all active:scale-95"
          disabled={!file}
        >
          Upload to S3
        </button>
        
        {status && <p className="text-sm mt-4 text-center font-medium">{status}</p>}
      </div>
    </div>
  );
}
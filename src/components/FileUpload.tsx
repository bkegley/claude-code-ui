import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import type { ClaudeLogEntry } from "../types";

interface FileUploadProps {
	onFileLoad: (entries: ClaudeLogEntry[]) => void;
}

export function FileUpload({ onFileLoad }: FileUploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		try {
			const text = await file.text();
			const lines = text.trim().split("\n");
			const entries: ClaudeLogEntry[] = lines.map((line) => JSON.parse(line));
			onFileLoad(entries);
		} catch (error) {
			console.error("Error parsing file:", error);
			alert("Failed to parse log file. Please ensure it's a valid JSONL file.");
		}
	};

	return (
		<div className="flex items-center gap-4 p-4 border rounded-lg">
			<Input
				ref={fileInputRef}
				type="file"
				accept=".jsonl"
				onChange={handleFileSelect}
				className="hidden"
			/>
			<Button
				onClick={() => fileInputRef.current?.click()}
				variant="outline"
				className="gap-2"
			>
				<Upload className="h-4 w-4" />
				Load Claude Log File
			</Button>
		</div>
	);
}

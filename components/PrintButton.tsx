// src/components/PrintButton.tsx
'use client';
import { Button } from "./ui/button";
import { Printer } from "lucide-react";

export default function PrintButton() {
    return (
        <Button onClick={() => window.print()} className="flex items-center gap-2 no-print">
            <Printer className="h-4 w-4" />
            Print or Save as PDF
        </Button>
    );
}
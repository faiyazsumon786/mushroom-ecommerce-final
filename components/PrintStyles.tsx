// src/components/PrintStyles.tsx
'use client'; // <-- এই লাইনটি খুবই গুরুত্বপূর্ণ

export default function PrintStyles() {
    return (
        <style jsx global>{`
            @media print {
                .no-print {
                    display: none !important;
                }
                body {
                    background-color: white !important;
                }
            }
        `}</style>
    );
}
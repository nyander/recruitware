import { Link } from "@inertiajs/react";

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-[#213341] px-4">
            {/* Logo Section */}
            <div className="mb-10">
                <Link href="/">
                    <h1 className="text-4xl font-bold text-[#F9BA47] text-center tracking-wide">
                        Recruit
                        <span className="font-light text-white">Ware</span>
                    </h1>
                </Link>
            </div>

            {/* Main Content Section */}
            <main className="w-full max-w-md p-10 bg-[#2c4456] shadow-lg rounded-xl">
                <div>{children}</div>
            </main>
        </div>
    );
}

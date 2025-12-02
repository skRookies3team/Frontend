export const Logo = () => {
    return (
        <div className="flex items-center gap-2">
            <img
                src="/placeholder-logo.svg"
                alt="PetLog Logo"
                className="h-8 w-auto"
            />
            <span className="font-bold text-xl tracking-tight text-slate-900">PetLog</span>
        </div>
    );
};
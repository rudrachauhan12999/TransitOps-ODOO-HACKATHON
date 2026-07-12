interface StatusBadgeProps {
    status: "Operational" | "Delayed" | "Critical" | "Maintenance";
}


export default function StatusBadge({
    status
}: StatusBadgeProps) {


    const styles = {

        Operational:
            "bg-green-500/10 text-green-400",

        Delayed:
            "bg-yellow-500/10 text-yellow-400",

        Critical:
            "bg-red-500/10 text-red-400",

        Maintenance:
            "bg-blue-500/10 text-blue-400"

    };


    return (

        <span
            className={`
            px-2 py-1
            rounded-md
            text-xs
            font-medium
            ${styles[status]}
            `}
        >

            {status}

        </span>

    );

}

export interface Driver {

    id: string;

    name: string;

    licenseNumber: string;

    assignedVehicle?: string;

    availability: "Available" | "Busy" | "Off Duty";

    rating: number;

    phone: string;

}

import type { Vehicle } from "@/domain/dataset";
import { Icon } from "@/components/Icon";

export function VehicleSelector({
  vehicles,
  activeVehicleId,
  onSelect,
  onAdd,
}: {
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <>
      <div className="sidebar-label">MES VÉHICULES</div>
      <div className="vehicle-list">
        {vehicles.map((vehicle) => (
          <button
            key={vehicle.id}
            className={`vehicle-item ${vehicle.id === activeVehicleId ? "active" : ""}`}
            onClick={() => onSelect(vehicle.id)}
            aria-current={vehicle.id === activeVehicleId ? "true" : undefined}
          >
            <span className="vehicle-icon"><Icon name="car" size={18} /></span>
            <span><strong>{vehicle.make} {vehicle.model}</strong><small>Boîtier Bioflex</small></span>
            {vehicle.id === activeVehicleId && <i />}
          </button>
        ))}
      </div>
      <button className="btn btn-secondary add-vehicle" onClick={onAdd}>
        <Icon name="plus" size={17} /> Ajouter un véhicule
      </button>
    </>
  );
}

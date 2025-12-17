export const baseMileage = { twoWheeler: 35, fourWheeler: 18 };

export function calculateRideCost({
    distanceKm,
    vehicleType,
    isAc = false,
    fuelType = "petrol",
    seats = 1,
    fuelPrices,
    durationMin
}) {
    if (!fuelPrices || !fuelPrices[fuelType]) {
        throw new Error(`Fuel price for ${fuelType} not provided`);
    }

    // 1Get base mileage
    let mileage = vehicleType === "two-wheeler" ? baseMileage.twoWheeler : baseMileage.fourWheeler;

    // Apply AC factor (reduces mileage)
    if (isAc && vehicleType === "four-wheeler") {
        mileage *= 0.85; // 15% reduction for AC
    }

    // Fuel cost per km
    const fuelCostPerKm = fuelPrices[fuelType] / mileage;

    // Total cost
    const totalCost = fuelCostPerKm * distanceKm;

    // Fare per passenger
    const farePerPassenger = totalCost / seats;

    return {
        distanceKm: distanceKm.toFixed(2),
        fuelCostPerKm: fuelCostPerKm.toFixed(2),
        totalCost: totalCost.toFixed(2),
        pricePerPerson: farePerPassenger.toFixed(2),
        acApplied: isAc,
        durationMin: durationMin.toFixed(2)
    };
}

function toPublicOwnerDto(owner) {
  if (!owner) return null;

  return {
    id: owner._id?.toString(),
    name: owner.name,
  };
}

function toPublicCraneDto(crane) {
  return {
    id: crane._id.toString(),
    title: crane.title,

    producer: crane.producer,
    seriesCode: crane.seriesCode,
    capacityClassNumber: crane.capacityClassNumber,
    capacity: crane.capacity,

    radius: crane.radius,
    height: crane.height,

    images: crane.images,
    description: crane.description,

    salePrice: crane.salePrice,
    rentPrice: crane.rentPrice,

    location: crane.location,
    status: crane.status,
    availability: crane.availability,

    owner: toPublicOwnerDto(crane.owner),

    createdAt: crane.createdAt,
    updatedAt: crane.updatedAt,
  };
}

function toOwnerCraneDto(crane) {
  return {
    id: crane._id.toString(),
    title: crane.title,

    producer: crane.producer,
    seriesCode: crane.seriesCode,
    capacityClassNumber: crane.capacityClassNumber,
    capacity: crane.capacity,
    variantRevision: crane.variantRevision,

    radius: crane.radius,
    height: crane.height,

    images: crane.images,
    description: crane.description,

    salePrice: crane.salePrice,
    rentPrice: crane.rentPrice,

    location: crane.location,
    status: crane.status,
    availability: crane.availability,

    ownerId: crane.owner?._id
      ? crane.owner._id.toString()
      : crane.owner?.toString(),

    createdAt: crane.createdAt,
    updatedAt: crane.updatedAt,
  };
}

function toAdminCraneDto(crane) {
  return {
    id: crane._id.toString(),
    title: crane.title,

    producer: crane.producer,
    seriesCode: crane.seriesCode,
    capacityClassNumber: crane.capacityClassNumber,
    capacity: crane.capacity,
    variantRevision: crane.variantRevision,

    radius: crane.radius,
    height: crane.height,

    images: crane.images,
    description: crane.description,

    salePrice: crane.salePrice,
    rentPrice: crane.rentPrice,

    location: crane.location,
    status: crane.status,
    availability: crane.availability,

    owner: crane.owner
      ? {
          id: crane.owner._id?.toString(),
          name: crane.owner.name,
          email: crane.owner.email,
          role: crane.owner.role,
        }
      : null,

    createdAt: crane.createdAt,
    updatedAt: crane.updatedAt,
  };
}

module.exports = {
  toPublicCraneDto,
  toOwnerCraneDto,
  toAdminCraneDto,
};

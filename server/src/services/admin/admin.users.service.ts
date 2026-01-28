import prisma from "../../prisma/client.js";
// import bcrypt from "bcrypt"; // ⭐ Comment out bcrypt

interface UserInput {
  name: string;
  email: string;
  password?: string;
  role?: "user" | "admin";
}

interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "user" | "admin";
}

// const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10); // ⭐ Not needed

export const getAll = async (params: QueryParams) => {
  const page = Math.max(1, Number(params.page || 1));
  const limit = Math.min(100, Number(params.limit || 10));
  const skip = (page - 1) * limit;
  const search = params.search ? String(params.search) : undefined;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (params.role) {
    where.role = params.role;
  }

  try {
    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          created_at: true,
          // ❌ DELETE: Xóa _count.ratings
          // _count: {
          //   select: { ratings: true },
          // },
        },
        orderBy: { created_at: "desc" },
        take: limit,
        skip,
      }),
      prisma.users.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        ...u,
        // ❌ DELETE: Không có ratingsCount
        // ratingsCount: u._count.ratings,
      })),
      meta: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    };
  } catch (error) {
    console.error("❌ Error in getAll users:", error);
    throw new Error("Failed to fetch users");
  }
};

export const getById = async (id: number) => {
  const user = await prisma.users.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
      // ❌ DELETE: Xóa _count.ratings
      // _count: {
      //   select: { ratings: true },
      // },
    },
  });

  if (!user) return null;

  return {
    ...user,
    // ❌ DELETE: Không có ratingsCount
    // ratingsCount: user._count.ratings,
  };
};

export const create = async (input: UserInput) => {
  if (!input.name || !input.name.trim()) {
    throw new Error("Name is required");
  }
  if (!input.email || !input.email.trim()) {
    throw new Error("Email is required");
  }
  if (!input.password || !input.password.trim()) {
    throw new Error("Password is required");
  }

  try {
    const existing = await prisma.users.findUnique({
      where: { email: input.email.trim() },
    });

    if (existing) {
      throw new Error("Email already exists");
    }

    // ⭐ Store password as plaintext (NO HASHING)
    const user = await prisma.users.create({
      data: {
        name: input.name.trim(),
        email: input.email.trim(),
        password: input.password.trim(), // ⭐ No bcrypt.hash()
        role: input.role || "user",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    return user;
  } catch (error: any) {
    console.error("❌ Error in create user:", error);
    if (error.message === "Email already exists") {
      throw error;
    }
    throw new Error("Failed to create user");
  }
};

export const update = async (id: number, input: Partial<UserInput>) => {
  try {
    const updateData: any = {};

    if (input.name !== undefined) {
      if (!input.name.trim()) {
        throw new Error("Name cannot be empty");
      }
      updateData.name = input.name.trim();
    }

    if (input.email !== undefined) {
      if (!input.email.trim()) {
        throw new Error("Email cannot be empty");
      }

      const existing = await prisma.users.findFirst({
        where: {
          email: input.email.trim(),
          NOT: { id },
        },
      });

      if (existing) {
        throw new Error("Email already in use");
      }

      updateData.email = input.email.trim();
    }

    // ⭐ Store password as plaintext (NO HASHING)
    if (input.password && input.password.trim()) {
      updateData.password = input.password.trim(); // ⭐ No bcrypt.hash()
    }

    if (input.role !== undefined) {
      if (!["user", "admin"].includes(input.role)) {
        throw new Error("Valid role is required (user or admin)");
      }
      updateData.role = input.role;
    }

    return await prisma.users.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in update user:", error);
    if (
      error.message.includes("cannot be empty") ||
      error.message === "Email already in use" ||
      error.message.includes("Valid role")
    ) {
      throw error;
    }
    throw new Error("Failed to update user");
  }
};

export const updateRole = async (id: number, role: "user" | "admin") => {
  if (!["user", "admin"].includes(role)) {
    throw new Error("Valid role is required (user or admin)");
  }

  try {
    return await prisma.users.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });
  } catch (error) {
    console.error("❌ Error in updateRole:", error);
    throw new Error("Failed to update user role");
  }
};

export const remove = async (id: number) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    await prisma.$transaction(async (tx) => {
      // ❌ DELETE: Không xóa ratings
      // await tx.ratings.deleteMany({ where: { user_id: id } });

      // ⭐ Xóa users_data
      await tx.users_data.deleteMany({ where: { user_id: id } });

      await tx.users.delete({ where: { id } });
    });

    return true;
  } catch (error) {
    console.error("❌ Error in remove user:", error);
    throw new Error("Failed to delete user");
  }
};
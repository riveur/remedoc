import { and, eq } from 'drizzle-orm'
import { DateTime } from 'luxon'

import { db } from '#core/services/db/main'
import { medications, type NewMedication } from '#core/services/db/schema'

export class MedicationRepository {
  async create(data: Omit<NewMedication, 'createdAt' | 'updatedAt' | 'active'>) {
    const [medication] = await db.insert(medications).values(data).returning()
    return medication
  }

  async findById(id: number) {
    const [medication] = await db.select().from(medications).where(eq(medications.id, id))
    return medication
  }

  async findAll(options: { userId?: number; activeOnly?: boolean } = {}) {
    const { userId, activeOnly = true } = options

    const query = db
      .select()
      .from(medications)
      .where(
        and(
          userId ? eq(medications.userId, userId) : undefined,
          activeOnly ? eq(medications.active, true) : undefined
        )
      )

    return await query.orderBy(medications.name)
  }

  async update(
    id: number,
    data: Partial<Omit<NewMedication, 'createdAt' | 'updatedAt' | 'id' | 'userId'>>
  ) {
    const [updated] = await db
      .update(medications)
      .set({ ...data, updatedAt: DateTime.now().toJSDate() })
      .where(eq(medications.id, id))
      .returning()
    return updated
  }

  async delete(id: number) {
    await db.delete(medications).where(eq(medications.id, id))
  }
}

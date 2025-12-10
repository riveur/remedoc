import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const CreateMedicationController = () =>
  import('#medication/controllers/create_medication_controller')

router
  .group(() => {
    router.post('/', [CreateMedicationController]).middleware(middleware.auth({ guards: ['api'] }))
  })
  .prefix('/api/medications')

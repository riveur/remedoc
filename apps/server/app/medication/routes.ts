import router from '@adonisjs/core/services/router'

import { middleware } from '#start/kernel'

const ListMedicationController = () => import('#medication/controllers/list_medication_controller')
const CreateMedicationController = () =>
  import('#medication/controllers/create_medication_controller')
const ShowMedicationController = () => import('#medication/controllers/show_medication_controller')
const UpdateMedicationController = () =>
  import('#medication/controllers/update_medication_controller')
const ToggleArchiveMedicationController = () =>
  import('#medication/controllers/toggle_archive_medication_controller')

router
  .group(() => {
    router.get('/', [ListMedicationController]).middleware(middleware.auth({ guards: ['api'] }))
    router.post('/', [CreateMedicationController]).middleware(middleware.auth({ guards: ['api'] }))
    router
      .get('/:medicationId', [ShowMedicationController])
      .middleware(middleware.auth({ guards: ['api'] }))
    router
      .put('/:medicationId', [UpdateMedicationController])
      .middleware(middleware.auth({ guards: ['api'] }))
    router
      .post('/:medicationId/archive', [ToggleArchiveMedicationController])
      .middleware(middleware.auth({ guards: ['api'] }))
  })
  .prefix('/api/medications')

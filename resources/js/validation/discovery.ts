import * as yup from 'yup'

export const discoverySchema = yup.object({
  projectType: yup.string().required('Project type is required.'),
  industry: yup.string().trim().required('Industry is required.'),
  budgetUsd: yup.number().typeError('Budget is required.').required('Budget is required.').moreThan(0, 'Budget must be greater than 0.'),
  timelineStart: yup.date().required('Timeline start is required.'),
  timelineEnd: yup
    .date()
    .required('Timeline end is required.')
    .when('timelineStart', ([timelineStart], schema) =>
      timelineStart ? schema.min(timelineStart as Date, 'Timeline end must be after timeline start.') : schema,
    ),
  features: yup.array().of(yup.string().required()).min(1, 'Add at least one feature.'),
  platforms: yup.array().of(yup.string().required()).min(1, 'Select at least one platform.'),
})

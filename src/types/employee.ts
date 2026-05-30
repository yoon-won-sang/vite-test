export type EmployeeStatus = 'Active' | 'Inactive'

export interface Employee {
  id: number
  name: string
  age: number
  department: string
  status: EmployeeStatus
}

export type EmployeeFormValues = Omit<Employee, 'id'>

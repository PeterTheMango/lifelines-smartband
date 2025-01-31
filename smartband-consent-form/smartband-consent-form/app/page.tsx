"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Image from "next/image"

const formSchema = z.object({
  givenName: z.string().min(1, "Given name is required"),
  lastName: z.string().min(1, "Last name is required"),
  smartbandSerial: z.string().length(8, "Serial number must be exactly 8 characters").regex(/^[a-zA-Z0-9]+$/, "Serial number must be alphanumeric"),
  countryOfResidence: z.string().min(1, "Country of residence is required"),
  documentId: z.string().min(1, "ID/Passport number is required"),
  consentToTracking: z.boolean().refine(val => val === true, {
    message: "You must consent to location tracking for emergency rescue purposes"
  })
})

function ConsentForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      givenName: "",
      lastName: "",
      smartbandSerial: "",
      countryOfResidence: "",
      documentId: "",
      consentToTracking: false,
    },
  })

  function onSubmit(values) {
    console.log(values)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 relative py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(30deg, #22c55e 12%, transparent 12.5%, transparent 87%, #22c55e 87.5%, #22c55e),
              linear-gradient(150deg, #22c55e 12%, transparent 12.5%, transparent 87%, #22c55e 87.5%, #22c55e),
              linear-gradient(30deg, #22c55e 12%, transparent 12.5%, transparent 87%, #22c55e 87.5%, #22c55e),
              linear-gradient(150deg, #22c55e 12%, transparent 12.5%, transparent 87%, #22c55e 87.5%, #22c55e),
              linear-gradient(60deg, #77e59c 25%, transparent 25.5%, transparent 75%, #77e59c 75%, #77e59c)
            `,
            backgroundSize: '80px 140px',
            backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0',
            opacity: '0.15'
          }}
        />
      </div>
      <div className="max-w-2xl mx-auto p-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md relative">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/SmartBand-removebg-preview.png"
            alt="SmartBand Logo"
            width={120}
            height={120}
            className="mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800 text-center">SmartBand Consent Form</h1>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="givenName" className="text-sm font-medium text-gray-700">Given Name</label>
                <input
                  {...form.register("givenName")}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                {form.formState.errors.givenName && (
                  <p className="text-red-500 text-xs">{form.formState.errors.givenName.message}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</label>
                <input
                  {...form.register("lastName")}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                {form.formState.errors.lastName && (
                  <p className="text-red-500 text-xs">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="smartbandSerial" className="text-sm font-medium text-gray-700">SmartBand Serial Number</label>
              <input
                {...form.register("smartbandSerial")}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                placeholder="Enter 8-character serial number"
              />
              {form.formState.errors.smartbandSerial && (
                <p className="text-red-500 text-xs">{form.formState.errors.smartbandSerial.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="countryOfResidence" className="text-sm font-medium text-gray-700">Country of Residence</label>
              <input
                {...form.register("countryOfResidence")}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
              {form.formState.errors.countryOfResidence && (
                <p className="text-red-500 text-xs">{form.formState.errors.countryOfResidence.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="documentId" className="text-sm font-medium text-gray-700">National ID/Passport Number</label>
              <input
                {...form.register("documentId")}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
              {form.formState.errors.documentId && (
                <p className="text-red-500 text-xs">{form.formState.errors.documentId.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-start space-x-2 bg-gray-50 p-4 rounded-md border border-gray-200">
                <input
                  type="checkbox"
                  {...form.register("consentToTracking")}
                  className="mt-1.5 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="consentToTracking" className="text-sm text-gray-600">
                  I understand and consent that my SmartBand device will collect and transmit my location data to emergency services in the event of an emergency. This data will only be used for emergency rescue purposes and will help first responders locate me quickly when needed. I acknowledge that this feature is essential for my safety and is a required condition for using the SmartBand device.
                </label>
              </div>
              {form.formState.errors.consentToTracking && (
                <p className="text-red-500 text-xs">{form.formState.errors.consentToTracking.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2.5 px-4 rounded-md hover:bg-green-600 transition-colors duration-200 text-sm font-medium shadow-sm"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  )
}

export default ConsentForm

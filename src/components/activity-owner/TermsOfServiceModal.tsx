
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/contexts/LanguageContext"

interface TermsOfServiceModalProps {
  children: React.ReactNode
}

export const TermsOfServiceModal = ({ children }: TermsOfServiceModalProps) => {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms of Service (TOS)</DialogTitle>
          <DialogDescription>
            Between Guidestination and Tourism Activity Providers
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Purpose</h3>
              <p>
                These Terms of Service (TOS) define the rights and obligations between Guidestination and tourism activity providers ("Providers") who wish to offer their services through the platform.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Role of the Platform</h3>
              <div className="space-y-2">
                <p>
                  Guidestination acts as an intermediary between Providers and customers. The platform enables Providers to list their activities and use an online booking system. It does not guarantee the sale of services and is not responsible for relationships between Providers and customers.
                </p>
                <p>
                  The booking platform acts solely as an intermediary between the customer and the activity provider. As such, the service is sold directly by the activity provider to the customer, and the platform does not intervene in the sale itself.
                </p>
                <p>
                  Payment for the service is processed via Stripe, which automatically splits the payment among the activity provider, the platform, and any other relevant parties.
                </p>
                <p>
                  Because the platform is not the direct seller of the service, it is not responsible for the quality or execution of the service. Therefore, the platform is not required to hold any specific insurance or license related to the service, as the activity provider is solely responsible for these obligations.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-bold text-lg mb-3">Rights and Obligations of the Parties</h2>
              
              <h3 className="font-semibold text-base mb-2">3. Obligations of the Provider</h3>
              <p className="mb-2">The Provider agrees to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide accurate, up-to-date, and complete information about their activities (description, pricing, cancellation policy, etc.).</li>
                <li>Comply with all applicable laws and regulations related to their services.</li>
                <li>Ensure high-quality service delivery and customer satisfaction.</li>
                <li>Hold the necessary licenses, certifications, or insurance required for their activities.</li>
                <li>Immediately notify the platform in case of service unavailability.</li>
                <li>Follow the platform's quality and transparency guidelines.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. Obligations of the Platform</h3>
              <p className="mb-2">The platform agrees to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide a management interface for Providers to list and manage their services.</li>
                <li>Ensure visibility of Providers' offerings to potential customers.</li>
                <li>Process payments and transfer funds to Providers after commission deductions.</li>
                <li>Offer customer support to assist both Providers and customers in case of disputes.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-lg mb-3">Financial Terms and Commissions</h2>
              
              <h3 className="font-semibold text-base mb-2">5. Commissions and Payments</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>The platform can change the commission on each booking anytime.</li>
                <li>Payments are collected by the platform and transferred to Providers according to a defined schedule (e.g., every 7 days).</li>
                <li>In case of cancellation, refunds follow the policy set on the platform.</li>
                <li>In the event of a dispute, the platform may temporarily withhold payments until the issue is resolved.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5.1 Commission and Activity Pricing</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>The Provider is free to set the base price of their activities according to their own pricing policy. The Platform will automatically apply a 20% commission on the base price defined by the Provider. This commission is deducted before the payout and retained by the Platform.</li>
                <li>Guidestination reserves the right to modify the commission rate at any time. Providers will be informed of any changes, but they will always retain full control over their base prices.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-lg mb-3">Cancellations and Experience Disruptions</h2>
              
              <h3 className="font-semibold text-base mb-2">6. Provider Cancellations</h3>
              <div className="space-y-2">
                <p>
                  Providers should avoid canceling bookings. However, in cases of force majeure or legitimate inability to provide the service, they must notify the platform immediately.
                </p>
                <p>Frequent last-minute cancellations may result in:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Reduced visibility on the platform.</li>
                  <li>Financial penalties or withheld payments.</li>
                  <li>Temporary or permanent suspension of the Provider's account in case of repeated cancellations.</li>
                </ul>
                <p>If a Provider cancels a booking, the customer will receive a full refund.</p>
                <p className="italic">
                  "In the event of severe weather conditions that render the activity impossible, the customer shall be entitled to either reschedule the activity or receive a full refund."
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Experience Disruptions and Non-Conformity</h3>
              <p className="mb-2">A customer may request a full or partial refund if:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The Provider cancels the booking the activity. (full refund)</li>
                <li>The Provider is unable to deliver the experience (e.g., technical issues for online experiences). (full refund)</li>
                <li>The Provider arrives more than 20 minutes late, forcing the customer to cancel.</li>
                <li>The experience presents a risk to the health or safety of the customer.</li>
                <li>The experience significantly differs from its description, preventing reasonable participation.</li>
              </ul>
              
              <h4 className="font-medium mt-3 mb-2">Cancellation Policy for Activity Providers</h4>
              <p>
                If an activity provider cancels a booking after payment, a penalty of 20% of the canceled activity's commission will be deducted from their next booking. If a second cancellation occurs without cause, the provider will be removed from the platform.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-lg mb-3">Provider Verification Criteria</h2>
              
              <h3 className="font-semibold text-base mb-2">8. Document Validation</h3>
              <p className="mb-2">All Providers must submit:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>An official document proving their business or professional activity.</li>
                <li>A valid insurance policy covering their services.</li>
              </ul>
              <p className="mt-2 mb-2">An experience will not be published if:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Required documents are missing, expired, or non-compliant.</li>
                <li>The details on the documents do not match the Provider's profile.</li>
                <li>The Provider does not hold the necessary authorizations.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">9. Listing Requirements</h3>
              <p className="mb-2">The Provider must ensure a clear and detailed experience description, including:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>A precise breakdown of the activities included.</li>
                <li>The exact meeting point address and instructions to find the Provider.</li>
                <li>What is included in the price (equipment, meals, transport).</li>
                <li>What customers must bring or pay for themselves.</li>
                <li>The exact date and time of the experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-lg mb-3">Liability and Penalties</h2>
              
              <h3 className="font-semibold text-base mb-2">10. Provider Liability</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>The Provider is solely responsible for the quality and safety of their services.</li>
                <li>The Provider must have all necessary insurance coverage.</li>
                <li>The platform is not liable for any incidents occurring during the experience.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">11. Platform Liability</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>The platform is not responsible for disputes between Providers and customers.</li>
                <li>The platform reserves the right to suspend or remove Providers with frequent customer complaints.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">12. Sanctions for Non-Compliance</h3>
              <p className="mb-2">If a Provider violates these TOS, the platform may:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Reduce the visibility of their listings.</li>
                <li>Temporarily suspend their account.</li>
                <li>Permanently remove them from the platform in cases of fraud, misconduct, or serious violations.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-lg mb-3">Duration, Termination, and Disputes</h2>
              
              <h3 className="font-semibold text-base mb-2">13. Duration and Termination</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>The contract is indefinite.</li>
                <li>Either party may terminate the contract immediately.</li>
                <li>The platform may immediately suspend an account in case of serious breaches (e.g., fraud, repeated violations).</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">14. Dispute Resolution</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Any disputes must be reported within 48 hours.</li>
                <li>Refund decisions will be made based on the severity of the issue.</li>
                <li>If no amicable resolution is found, disputes will be handled in the jurisdiction country.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-lg mb-3">Additional Provisions</h2>
              
              <h3 className="font-semibold text-base mb-2">15. Intellectual Property</h3>
              <p>
                The Provider authorizes the platform to use photos, videos, and descriptions of their services for promotional purposes.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">16. Data Protection</h3>
              <p>
                Both the platform and Providers must comply with applicable data protection laws.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">17. Acceptance of TOS</h3>
              <p>
                By registering on the platform, the Provider fully accepts these Terms of Service.
              </p>
            </section>
          </div>
        </ScrollArea>
        <div className="flex justify-end pt-4">
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import Head from 'next/head'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function Home() {
  return (
    <>
      <Head>
        <title>TourConnect - Connect Tourism Activities with Industry Partners</title>
        <meta name='description' content='Platform connecting tourism activity providers with hotels, restaurants, and Airbnb hosts through an automated commission system' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div className='min-h-screen flex flex-col'>
        <Navbar />
        
        <main className='flex-1'>
          <section className='py-20 px-4 text-center bg-gradient-to-b from-background to-secondary/20'>
            <div className='container mx-auto max-w-[800px]'>
              <h1 className='text-4xl md:text-6xl font-bold mb-6'>
                Connect Tourism Activities with Key Partners
              </h1>
              <p className='text-xl text-muted-foreground mb-8'>
                Streamline bookings and earn commissions through our automated platform connecting activity providers with hotels, restaurants, and Airbnb hosts.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button size='lg' asChild>
                  <Link href='/providers/register'>List Your Activity</Link>
                </Button>
                <Button size='lg' variant='outline' asChild>
                  <Link href='/partners'>Become a Partner</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className='py-16 container'>
            <h2 className='text-3xl font-bold text-center mb-12'>How It Works</h2>
            <div className='grid md:grid-cols-3 gap-8'>
              <div className='text-center'>
                <h3 className='text-xl font-semibold mb-4'>For Activity Providers</h3>
                <p className='text-muted-foreground'>List your activities and reach more customers through our network of tourism partners.</p>
              </div>
              <div className='text-center'>
                <h3 className='text-xl font-semibold mb-4'>For Partners</h3>
                <p className='text-muted-foreground'>Offer curated activities to your guests and earn commissions on every booking.</p>
              </div>
              <div className='text-center'>
                <h3 className='text-xl font-semibold mb-4'>For Travelers</h3>
                <p className='text-muted-foreground'>Discover and book amazing local experiences recommended by trusted hospitality providers.</p>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}
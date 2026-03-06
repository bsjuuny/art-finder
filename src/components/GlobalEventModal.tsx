'use client';

import { useSearchParams } from 'next/navigation';
import Modal from '@/components/Modal';
import EventDetailContent from '@/components/EventDetailContent';
import { Suspense } from 'react';

function GlobalEventModalContent() {
    const searchParams = useSearchParams();
    const eventId = searchParams.get('eventId');

    // If we are on /event page, don't show modal even if param exists (avoid double content)
    // Actually /event page uses ?id=...
    // Modal uses ?eventId=... to differentiate.
    // If user is on /event?id=123, and somehow ?eventId=456 is added? unlikely.

    if (!eventId) return null;

    return (
        <Modal>
            <EventDetailContent id={eventId} isModal={true} />
        </Modal>
    );
}

export default function GlobalEventModal() {
    return (
        <Suspense fallback={null}>
            <GlobalEventModalContent />
        </Suspense>
    );
}

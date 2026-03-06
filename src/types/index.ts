export interface CultureEvent {
    seq: string;
    title: string;
    startDate: string;
    endDate: string;
    place: string;
    realmName: string;
    area: string;
    sigungu?: string;
    thumbnail: string;
    gpsX: string;
    gpsY: string;
    url: string;
}

export interface ApiResponse {
    response: {
        header: {
            resultCode: string;
            resultMsg: string;
        };
        body: {
            items?: {
                item?: CultureEvent[] | CultureEvent;
            };
            numOfrows?: string | number;
            PageNo?: string | number;
            totalCount?: string | number;
        };
    };
}

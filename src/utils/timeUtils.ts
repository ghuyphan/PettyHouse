import moment from 'moment';

export const getTimeAgo = (createdDate: moment.Moment, t: (key: string) => string): string => {
    const currentDate = moment();
    const timeDiffMinutes = currentDate.diff(createdDate, 'minutes');
    const timeDiffHours = Math.floor(timeDiffMinutes / 60);
    const timeDiffSeconds = currentDate.diff(createdDate, 'seconds');
    
    if (timeDiffSeconds < 60) {
        return t('justNow');
    } else if (timeDiffMinutes < 60) {
        return `${timeDiffMinutes} ${t('minutesAgo')}`;
    } else if (timeDiffHours < 24) {
        return `${timeDiffHours} ${t('hoursAgo')}`;
    } else {
        const daysDiff = Math.floor(timeDiffHours / 24);
        if (daysDiff < 7) {
            return `${daysDiff} ${t('daysAgo')}`;
        } else if (daysDiff < 31) {
            const weeksDiff = Math.floor(daysDiff / 7);
            return `${weeksDiff} ${weeksDiff > 1 ? t('weeksAgo') : t('weekAgo')}`;
        } else {
            const monthsDiff = currentDate.diff(createdDate, 'months');
            return `${monthsDiff} ${monthsDiff > 1 ? t('monthsAgo') : t('monthAgo')}`;
        }
    }
};

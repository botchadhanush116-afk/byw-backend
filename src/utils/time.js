// File: src/utils/time.js
const moment = require('moment');

const formatTimeRemaining = (expiryTime) => {
    if (!expiryTime) return '';

    const now = moment();
    const expiry = moment(expiryTime);
    const diff = moment.duration(expiry.diff(now));

    if (diff.asMilliseconds() <= 0) return 'Expired';

    const days = Math.floor(diff.asDays());
    const hours = Math.floor(diff.asHours() % 24);
    const minutes = Math.floor(diff.asMinutes() % 60);

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;

    return result.trim() || 'Less than 1m';
};

const isAboutToExpire = (expiryTime, thresholdHours = 1) => {
    if (!expiryTime) return false;

    const now = moment();
    const expiry = moment(expiryTime);
    const diffHours = expiry.diff(now, 'hours', true);

    return diffHours > 0 && diffHours <= thresholdHours;
};

const generateOtpExpiry = (minutes = 5) => {
    return moment().add(minutes, 'minutes').toDate();
};

module.exports = {
    formatTimeRemaining,
    isAboutToExpire,
    generateOtpExpiry
};
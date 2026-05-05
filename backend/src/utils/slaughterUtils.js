/**
 * Converte "HH:mm" para total de minutos desde 00:00
 */
export function timeToMinutes(time) {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + (m || 0);
}

/**
 * Converte total de minutos para "HH:mm"
 */
export function minutesToTime(minutes) {
    const h = Math.floor(minutes / 60) % 24;
    const m = Math.round(minutes % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Calcula horários de um lote com base nas regras de intervalo.
 * 
 * Regra Intervalos:
 * - Se startTime cai DENTRO de intervalo: empurra para fim do intervalo.
 * - Se intervalo ocorre DURANTE execução: adiciona sua duração ao endTime.
 */
export function calculateLotTiming(total, previousEndTime, scheduleParams) {
    const { 
        rateHeadsPerHour = 100, 
        breakfastTime, 
        breakfastDuration = 0, 
        lunchTime, 
        lunchDuration = 0 
    } = scheduleParams;

    const durationMinutes = Math.ceil((total / rateHeadsPerHour) * 60);
    let startMinutes = timeToMinutes(previousEndTime);

    // Ajuste de início se cair dentro de intervalos
    if (breakfastTime && breakfastDuration > 0) {
        const bStart = timeToMinutes(breakfastTime);
        const bEnd = bStart + breakfastDuration;
        if (startMinutes >= bStart && startMinutes < bEnd) {
            startMinutes = bEnd;
        }
    }

    if (lunchTime && lunchDuration > 0) {
        const lStart = timeToMinutes(lunchTime);
        const lEnd = lStart + lunchDuration;
        if (startMinutes >= lStart && startMinutes < lEnd) {
            startMinutes = lEnd;
        }
    }

    let endMinutes = startMinutes + durationMinutes;

    // Adição de tempo se o intervalo ocorrer DURANTE o lote
    if (breakfastTime && breakfastDuration > 0) {
        const bStart = timeToMinutes(breakfastTime);
        if (startMinutes < bStart && endMinutes > bStart) {
            endMinutes += breakfastDuration;
        }
    }

    if (lunchTime && lunchDuration > 0) {
        const lStart = timeToMinutes(lunchTime);
        if (startMinutes < lStart && endMinutes > lStart) {
            endMinutes += lunchDuration;
        }
    }

    return {
        startTime: minutesToTime(startMinutes),
        endTime: minutesToTime(endMinutes),
        durationMinutes,
        total
    };
}

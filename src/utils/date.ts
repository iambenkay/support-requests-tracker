export const addMonth = (d: Date, n: number): Date => {
    d.setMonth(d.getMonth() + n);
    return d;
}
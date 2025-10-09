import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateNumber'
})
export class TruncateNumberPipe implements PipeTransform {
  transform(value: any, digits: number = 2): string {
    if (value == null || isNaN(value)) return '';

    const num = parseFloat(value);
    const factor = Math.pow(10, digits);
    const truncated = Math.floor(num * factor) / factor;

    // ใช้ Intl.NumberFormat เพื่อใส่ comma
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits
    }).format(truncated);
  }
}
